import java.nio.charset.StandardCharsets;
import java.nio.ByteBuffer;

/** Security-relevant outer headers are authenticated as GCM associated data. */
public record Packet(String source, String destination, long sequence, byte[] nonce, byte[] ciphertext) {
    public Packet { nonce = nonce.clone(); ciphertext = ciphertext.clone(); }
    @Override public byte[] nonce() { return nonce.clone(); }
    @Override public byte[] ciphertext() { return ciphertext.clone(); }
    public byte[] metadata() { return metadata(source, destination, sequence); }
    public static byte[] metadata(String source, String destination, long sequence) {
        byte[] a = source.getBytes(StandardCharsets.UTF_8), b = destination.getBytes(StandardCharsets.UTF_8);
        return ByteBuffer.allocate(4 + a.length + 4 + b.length + 8)
            .putInt(a.length).put(a).putInt(b.length).put(b).putLong(sequence).array();
    }
}
