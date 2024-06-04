import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import viewsRouter from "./routes/views.router.js";
import usersRouter from "./routes/user.router.js";
import sessionsRouter from "./routes/session.router.js";
import initializePassport from "./config/passport.config.js"
import "./database.js";
import passport from "passport";

const app = express(); 
const PUERTO = 8080; 

//Express-Handlebars: 

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars"); 
app.set("views", "./src/views");

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:"secretCoder",
    resave: true,
    saveUninitialized : true, 
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://fernandorudnevichinedita:231182@cluster0.xe7glky.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100
    })
}))

app.use(passport.initialize())
app.use(passport.session());
initializePassport();

//Rutas:

app.use("/", viewsRouter);
app.use("/api/users", usersRouter);
app.use("/api/sessions", sessionsRouter);


app.listen(PUERTO, () => {
    console.log("Escuchando en el puerto 8080");
})
