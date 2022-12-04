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

async function findBookingsByUserId(userId: number) {
  return prisma.booking.findMany ({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      Room: true
    },
  });
}

async function updateBookingRoomById(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId: roomId,
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
  findBookingsByUserId,
  updateBookingRoomById,
};

export default bookingRepository;
