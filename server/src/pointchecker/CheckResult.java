package pointchecker;

public record CheckResult(Point point, boolean hit, String time, long execMicros) {

    String toJson() {
        return "{\"x\":" + point.x().toPlainString()
                + ",\"y\":" + point.y()
                + ",\"r\":" + point.r()
                + ",\"hit\":" + hit
                + ",\"time\":\"" + time + "\""
                + ",\"execTime\":" + execMicros
                + "}";
    }
}
