import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketTypeWithHotel,
  createTicket,
  createHotel,
  createRoomWithHotelId,
  createBooking,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
  
      const response = await server.post("/booking").send({ "roomId": 1 }).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });
   
    it("should respond with status 404 when roomId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);   
  
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when roomId is equal or minor than 0", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);   
  
      const response = await server.post("/booking").send({ "roomId": 0 }).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when ticket status is not PAID", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      await createBooking(createdRoom.id, user.id);
      await createBooking(createdRoom.id, user.id);
  
      const response = await server.post("/booking").send({ "roomId": createdRoom.id }).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when there is no room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);  
  
      const response = await server.post("/booking").send({ "roomId": 1 }).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when there is no vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      await createBooking(createdRoom.id, user.id);
      await createBooking(createdRoom.id, user.id);

      const response = await server.post("/booking").send({ "roomId": createdRoom.id }).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 201 when there is vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      await createBooking(createdRoom.id, user.id);
  
      const response = await server.post("/booking").send({ "roomId": createdRoom.id }).set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.CREATED);
    });
  });
});
