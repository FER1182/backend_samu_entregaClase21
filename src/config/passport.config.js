//instalamos npm i passport passport-local
import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";

import UsuarioModel from "../models/usuario.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";

const localStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new localStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;

        try {
          let usuario = await UsuarioModel.findOne({ email });
          if (usuario) {
            return done(null, false);
          }
          let nuevoUsuario = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };

          let resultado = await UsuarioModel.create(nuevoUsuario);
          return done(null, resultado);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //agregamos otra extrategia para el login
  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          let usuario = await UsuarioModel.findOne({ email });
          if (!usuario) {
            console.log("este usuario no existe");
            return done(null, false);
          }
          //si existe verifico la constrasena
          if (!isValidPassword(password, usuario)) {
            return done(null, false);
          }
          return done(null, usuario);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  //serializar y deserializar
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (id, done) => {
    let user = await UsuarioModel.findById({ _id: id });
    done(null, user);
  });

  //estrategia con github
  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: "Iv23lityBWu0mXIlObYB",
        clientSecret: "98acb0b29f8025b2fa44da2f860620df387ce409",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToke, refreshToken, profile, done) => {
        console.log(profile);

        try {
          let usuario = await UsuarioModel.findOne({
            email: profile._json.email,
          });

          if (!usuario) {
            let nuevoUsuario = {
              first_name: profile._json.name,
              last_name: "",
              age: 30,
              email: profile._json.email,
              password: "",
            };
            let resultado = await UsuarioModel.create(nuevoUsuario);
            return done(null, resultado);
          } else {
            done(null, usuario);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default initializePassport;
