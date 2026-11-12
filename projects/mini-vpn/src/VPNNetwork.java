import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Random;

public final class VPNNetwork {
    private record Delivery(Packet packet, int arrival) {}
    public static List<Packet> transmit(List<Packet> packets, double loss, int maxDelay, long seed) {
        if (loss < 0 || loss > 1 || maxDelay < 0) throw new IllegalArgumentException("Invalid network settings");
        Random random = new Random(seed);
        List<Delivery> queue = new ArrayList<>();
        for (int i = 0; i < packets.size(); i++) {
            if (random.nextDouble() >= loss) queue.add(new Delivery(packets.get(i), i * 10 + random.nextInt(maxDelay + 1)));
        }
        queue.sort(Comparator.comparingInt(Delivery::arrival));
        return queue.stream().map(Delivery::packet).toList();
    }
}
