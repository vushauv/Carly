package pw.react.backend.dto.mapper.booking;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import pw.react.backend.domain.booking.BookingStatusDictionary;
import pw.react.backend.dto.models.BookingStatusDto;
import pw.react.backend.utils.converters.response.DisplayNameConverter;

import java.util.List;

@Mapper(unmappedTargetPolicy = ReportingPolicy.IGNORE)
public class BookingStatusMapper {
    public BookingStatusDto toBookingStatus(BookingStatusDictionary bookingStatusDictionary)
    {
        var dto = new BookingStatusDto();
        dto.setId(bookingStatusDictionary.getBookingStatusDictionaryId());
        dto.setName(DisplayNameConverter.toDisplayName(bookingStatusDictionary.getName()));
        return dto;
    }

    public List<BookingStatusDto> toBookingStatusDtoList(List<BookingStatusDictionary> bookingStatusDictionaryList)
    {
        return bookingStatusDictionaryList.stream().map(this::toBookingStatus)
                .toList();
    }
}
