import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.HashSet;
import java.util.Set;

/** One directional key per sender, one session, no state restoration or key reuse. */
public final class VPNClient {
    private final String address, peer;
    private final SecretKey outgoingKey, incomingKey;
    private long sequence = 0;
    private long highestReceived = -1;
    private static final long REPLAY_WINDOW = 64;
    private final Set<Long> received = new HashSet<>();
    public VPNClient(String address, String peer, SecretKey outgoingKey, SecretKey incomingKey) {
        this.address = address; this.peer = peer;
        this.outgoingKey = outgoingKey; this.incomingKey = incomingKey;
    }
    public Packet send(String message) throws GeneralSecurityException {
        if (sequence == Long.MAX_VALUE) throw new IllegalStateException("Session exhausted; rekey required");
        long seq = sequence++;
        // Unique 96-bit nonce within a directional key's single session.
        byte[] nonce = ByteBuffer.allocate(12).putInt(0).putLong(seq).array();
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, outgoingKey, new GCMParameterSpec(128, nonce));
        cipher.updateAAD(Packet.metadata(address, peer, seq));
        return new Packet(address, peer, seq, nonce, cipher.doFinal(message.getBytes(StandardCharsets.UTF_8)));
    }
    public String receive(Packet packet) throws GeneralSecurityException {
        if (!packet.source().equals(peer) || !packet.destination().equals(address)) throw new GeneralSecurityException("Unexpected endpoint");
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, incomingKey, new GCMParameterSpec(128, packet.nonce()));
        cipher.updateAAD(packet.metadata());
        byte[] cleartext = cipher.doFinal(packet.ciphertext());
        // Authenticate before updating replay state; invalid packets cannot poison the window.
        long seq = packet.sequence();
        if (seq < 0 || seq <= highestReceived - REPLAY_WINDOW || received.contains(seq)) throw new GeneralSecurityException("Replay or stale packet rejected");
        highestReceived = Math.max(highestReceived, seq);
        received.add(seq);
        received.removeIf(n -> n <= highestReceived - REPLAY_WINDOW);
        return new String(cleartext, StandardCharsets.UTF_8);
    }
}
