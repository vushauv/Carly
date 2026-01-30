package pw.react.backend.controller.path;

public final class PathResolver {
    public static final String Root = "/api";
    public static class Car {
        public static final String Base = Root + "/cars";
        public static final String Images = "/images";
    }

    public static class Booking{
        public static final String Base = "/bookings";
    }

    public static class Flatly{
        public static final String Base = Root + "/flatly";
        public static final String Bookings = "/bookings";
        public static final String Flats = "/flats";
        public static final String FlatBookings = "/flat-bookings";
    }

    public static class Parkly {
        public static final String Base = Root + "/parkly";
        public static final String Cars = "/cars";
        public static final String CarBookings = "/car-bookings";
    }

    public static class Users{
        public static final String Base = Root + "users";
    }
}
