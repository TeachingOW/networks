import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

public class Main {
    interface Checked { void run() throws Exception; }
    static int assertions = 0;
    static void check(boolean ok, String name) { if (!ok) throw new AssertionError(name); assertions++; System.out.println("PASS: " + name); }
    static void reject(Checked action, String name) throws Exception {
        try { action.run(); } catch (GeneralSecurityException expected) { check(true, name); return; }
        throw new AssertionError(name + " was accepted");
    }
    public static void main(String[] args) throws Exception {
        KeyGenerator generator = KeyGenerator.getInstance("AES"); generator.init(256);
        SecretKey ab = generator.generateKey(), ba = generator.generateKey();
        VPNClient a = new VPNClient("A", "B", ab, ba), b = new VPNClient("B", "A", ba, ab);
        Packet original = a.send("Hello Client B");
        System.out.println("VPN session: AES-256-GCM; pre-shared in-memory directional keys");
        check(b.receive(original).equals("Hello Client B"), "Authenticated delivery");
        reject(() -> b.receive(original), "Replay rejected");
        Packet fresh = a.send("Integrity matters");
        byte[] changed = fresh.ciphertext(); changed[0] ^= 1;
        reject(() -> b.receive(new Packet(fresh.source(), fresh.destination(), fresh.sequence(), fresh.nonce(), changed)), "Ciphertext tampering rejected");
        reject(() -> b.receive(new Packet(fresh.source(), fresh.destination(), 900, fresh.nonce(), fresh.ciphertext())), "Header tampering rejected");
        check(b.receive(fresh).equals("Integrity matters"), "Invalid packets did not poison replay state");
        Packet p2 = a.send("Second"), p3 = a.send("Third");
        check(b.receive(p3).equals("Third") && b.receive(p2).equals("Second"), "Reordering inside replay window accepted");
        check(a.receive(b.send("Hello Client A")).equals("Hello Client A"), "Reverse directional key works");
        byte[] changedNonce = a.send("nonce").nonce(); changedNonce[0] ^= 1;
        Packet noncePacket = a.send("nonce payload");
        reject(() -> b.receive(new Packet("A", "B", noncePacket.sequence(), changedNonce, noncePacket.ciphertext())), "Nonce tampering rejected");
        Packet stale = a.send("stale");
        List<Packet> packets = new ArrayList<>();
        for (int i = 0; i < 100; i++) packets.add(a.send("Message " + i));
        List<Packet> delivered = VPNNetwork.transmit(packets, .2, 40, 42);
        for (Packet packet : delivered) b.receive(packet);
        check(delivered.size() < packets.size() && !delivered.isEmpty(), "Seeded delay, loss and reordering simulation");
        reject(() -> b.receive(stale), "Old packet outside replay window rejected");
        VPNClient stranger = new VPNClient("B", "A", ba, generator.generateKey());
        reject(() -> stranger.receive(a.send("secret")), "Wrong key rejected");
        System.out.println(assertions + " security and network checks passed. Educational tunnel only; no OS routing or key-exchange protocol.");
    }
}
