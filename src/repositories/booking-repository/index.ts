import { prisma } from "@/config";

async function findBookingsByRoomId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      Booking: true,
    }
  });
}

async function createBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId: roomId,
      userId: userId,
    }
  });
}

const bookingRepository = {
  findBookingsByRoomId,
  createBooking,
};

export default bookingRepository;
