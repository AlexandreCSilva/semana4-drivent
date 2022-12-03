import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function postBooking(roomId: number, userId: number) {
  if (!roomId || roomId < 1) {
    throw forbiddenError();
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

async function getBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
  if (!enrollment) {
    throw forbiddenError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
    
  return await bookingRepository.findBookingsByUserId(userId);
}

const bookingService = {
  postBooking,
  getBooking,
};

export default bookingService;
