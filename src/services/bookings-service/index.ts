import { forbiddenError, notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function postBooking(roomId: number, userId: number) {
  if (!roomId || roomId < 1) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
    
  const room = await bookingRepository.findBookingsByRoomId(roomId);

  if (!room) {
    throw notFoundError();
  }

  if (!userId || room.capacity == room.Booking.length) {
    throw forbiddenError();
  }  

  return await bookingRepository.createBooking(roomId, userId);
}

const bookingService = {
  postBooking,
};

export default bookingService;
