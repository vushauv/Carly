package pw.react.backend.utils.converters.response;

import java.util.Locale;

// Assume that all letters are stored in uppercase and empty spaces are replaced with underscore _
public class DisplayNameConverter {
    public static String toDisplayName(String name)
    {
        var withoutUnderscores = name.strip().replaceAll("_", " ");
        return capitalise(withoutUnderscores);
    }

    public static String fromDisplayName(String name)
    {
        var withUnderscores = name.strip().replaceAll(" ", "_");
        return withUnderscores.toUpperCase();
    }

    private static String capitalise(String word)
    {
        return word.substring(0, 1).toUpperCase(Locale.ROOT)
                + word.substring(1).toLowerCase(Locale.ROOT);
    }
}
// No displayName columns, cause what if we change the format we want to present data to the frontend
// then by simply changing toDisplayName function we can change the behavior
// with displayName we would have to modify a column in all rows
