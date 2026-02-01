

async cancelBooking(bookingId: number): Promise<void> {
    return apiRequest({
      method: "POST",
      url: `/parkly/car-bookings/${bookingId}/cancel`,
    });
  }