package pointchecker;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

final class PointValidator {
    private static final Pattern X_PATTERN = Pattern.compile("^-?\\d{1,2}([.,]\\d{1,10})?$");
    private static final BigDecimal X_MIN = BigDecimal.valueOf(-5);
    private static final BigDecimal X_MAX = BigDecimal.valueOf(3);
    private static final int Y_MIN = -4;
    private static final int Y_MAX = 4;
    private static final int R_MIN = 1;
    private static final int R_MAX = 5;

    private PointValidator() {
    }

    static Point parse(String body) {
        Map<String, String> params = parseForm(body);
        return new Point(parseX(params.get("x")), parseInt(params.get("y"), "Y", Y_MIN, Y_MAX),
                parseInt(params.get("r"), "R", R_MIN, R_MAX));
    }

    private static Map<String, String> parseForm(String body) {
        Map<String, String> params = new HashMap<>();
        for (String pair : body.split("&")) {
            int eq = pair.indexOf('=');
            if (eq <= 0) {
                continue;
            }
            params.put(pair.substring(0, eq), URLDecoder.decode(pair.substring(eq + 1), StandardCharsets.UTF_8).trim());
        }
        return Map.copyOf(params);
    }

    private static BigDecimal parseX(String text) {
        if (text == null || !X_PATTERN.matcher(text).matches()) {
            throw new IllegalArgumentException("X должен быть числом (не более 10 знаков после разделителя)");
        }
        BigDecimal x = new BigDecimal(text.replace(',', '.'));
        if (x.compareTo(X_MIN) < 0 || x.compareTo(X_MAX) > 0) {
            throw new IllegalArgumentException("X должен быть в диапазоне от -5 до 3");
        }
        return x.stripTrailingZeros();
    }

    private static int parseInt(String text, String name, int min, int max) {
        if (text == null) {
            throw new IllegalArgumentException("Не задан " + name);
        }
        int value = Integer.parseInt(text);
        if (value < min || value > max) {
            throw new IllegalArgumentException(name + " должен быть от " + min + " до " + max);
        }
        return value;
    }
}
