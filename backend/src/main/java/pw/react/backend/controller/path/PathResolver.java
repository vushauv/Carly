package pw.react.backend.controller.path;

public final class PathResolver {
    public static final String Root = "/";
    public static class Car {
        public static final String Base = Root + "cars";
        public static final String Images = "/images";
    }

    public static class Booking{
        public static final String Base = Root + "bookings";
    }

    public static class Flatly{
        public static final String Base = Root + "flatly";
        public static final String Bookings = Root + "bookings";
        public static final String Flats = Root + "flats";
        public static final String FlatBookings = Root + "flat-bookings";
    }

    public static class Parkly {
        public static final String Base = Root + "parkly";
        public static final String Cars = Root + "cars";
        public static final String CarBookings = Root + "car-bookings";
    }

    public static class Users{
        public static final String Base = Root + "users";
    }
}
