package pointchecker;

import java.math.BigDecimal;

final class AreaChecker {
    private static final BigDecimal TWO = BigDecimal.valueOf(2);

    private AreaChecker() {
    }

    static boolean isHit(Point point) {
        BigDecimal x = point.x();
        BigDecimal y = BigDecimal.valueOf(point.y());
        BigDecimal r = BigDecimal.valueOf(point.r());
        return inRectangle(x, y, r) || inQuarterCircle(x, y, r) || inTriangle(x, y, r);
    }

    // Вторая четверть: -R <= x <= 0, 0 <= y <= R/2.
    private static boolean inRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return x.signum() <= 0 && x.compareTo(r.negate()) >= 0
                && y.signum() >= 0 && y.multiply(TWO).compareTo(r) <= 0;
    }

    // Первая четверть: x >= 0, y >= 0, x^2 + y^2 <= R^2.
    private static boolean inQuarterCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return x.signum() >= 0 && y.signum() >= 0
                && x.multiply(x).add(y.multiply(y)).compareTo(r.multiply(r)) <= 0;
    }

    // Третья четверть: -R/2 <= x <= 0, -2x - R <= y <= 0.
    private static boolean inTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
        return x.signum() <= 0 && x.multiply(TWO).compareTo(r.negate()) >= 0
                && y.signum() <= 0 && y.compareTo(x.multiply(TWO).negate().subtract(r)) >= 0;
    }
}
