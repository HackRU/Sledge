import {Server, Socket} from "socket.io";
import {Validator, ValidatorResult} from "jsonschema";

import {
  Request, AddCategory, addCategory, AddHack, addHack, AddJudge, addJudge,
  AddSuperlative, addSuperlative, Authenticate, authenticate, Login, login,
  RateHack, rateHack, RankSuperlative, rankSuperlative, SetSynchronize,
  setSynchronize,

  Response, AuthenticateResponse, GenericResponse, LoginResponse, RequestMeta,

  ProtocolError, Synchronize
} from "../protocol/events.js";

/**
 * This class acts a wrapper around SocketIO events providing:
 *  - Type checking and validation
 *  - Request/Response handling with promises
 */
export class ServerEventWrapper {
  private validator : Validator;

  constructor(private sio : Server, private handlers : ServerEventHandlers) {
    this.validator = new Validator();

    let h = handlers;
    let reg = this.registerRequestHandler;
    sio.on("connect", s => {
      reg(s, addCategory, h.onAddCategory);
      reg(s, addHack, h.onAddHack);
      reg(s, addJudge, h.onAddJudge);
      reg(s, addSuperlative, h.onAddSuperlative);
      reg(s, authenticate, h.onAuthenticate);
      reg(s, login, h.onLogin);
      reg(s, rateHack, h.onRateHack);
      reg(s, rankSuperlative, h.onRankSuperlative);
      reg(s, setSynchronize, h.onSetSynchronize);
      s.on("disconnect", h.onDisconnect);

      h.onConnect(s.id);
    });
  };

  private registerRequestHandler = <E extends Request, R extends Response>(
    socket:Socket, meta:RequestMeta, handler:RequestHandler<E,R>
  ) => {
    socket.on(meta.name, data => {
      // Ensure request matches schema
      if (meta.schema) {
        let val = this.validator.validate(data, meta.schema);
        if (val.errors.length > 0) {
          this.sendProtocolError(socket.id, {
            eventName: meta.name,
            message: this.getFailedValidationMessage(meta.name, val),
            original: data
          });

          return;
        }
      }

      handler(socket.id, data).then((response:any) => {
        this.sio.to(socket.id).emit(meta.response, {
          ...response, returnId: data.returnId
        });
      });
    });
  }

  getFailedValidationMessage(eventName : string, val : ValidatorResult) : string {
    let message = `You sent a malformed ${eventName} request.\n`;
    for (let err of val.errors) {
      message += ` - ${err.message}\n`;
    }
    return message;
  }

  sendProtocolError(room : string, protocolError : ProtocolError) {
    this.sio.to(room).emit("ProtocolError", protocolError);
  }

  sendSynchronize(room : string, synchronize : Synchronize) {
    this.sio.to(room).emit("Synchronize", synchronize);
  }
}

export interface ServerEventHandlers {
  onConnect : (sid : string) => void;
  onDisconnect : (sid : string) => void;

  onAddCategory: RequestHandler<AddCategory, GenericResponse>;
  onAddHack : RequestHandler<AddHack, GenericResponse>;
  onAddJudge : RequestHandler<AddJudge, GenericResponse>;
  onAddSuperlative : RequestHandler<AddSuperlative, GenericResponse>;
  onAuthenticate : RequestHandler<Authenticate, AuthenticateResponse>;
  onLogin : RequestHandler<Login, LoginResponse>;
  onRateHack : RequestHandler<RateHack, GenericResponse>;
  onRankSuperlative : RequestHandler<RankSuperlative, GenericResponse>;
  onSetSynchronize : RequestHandler<SetSynchronize, GenericResponse>;
}

/*
 * A RequestHandler<Event, Response> takes the socket id and event and returns a
 * promise which will be used to respond. The returnId of the response returned
 * by the promise will be overwritten before sending.
 */
export type RequestHandler<E extends Request, R extends Response> =
  (sid:string, e:E) => Promise<R>;