import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    await bookingService.postBooking(roomId, userId);

    return res.sendStatus(httpStatus.CREATED);
  } catch (error) {
    if (error.name == "ForbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    return res.status(httpStatus.NOT_FOUND).send({});
  }
}
