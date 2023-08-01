
import { AboutData } from "@/@types/parseable/api/about";
import { Axios } from "./axios";
import { ABOUT_URL } from "./constants";

export const getCurrentAbout = () => {
    return Axios().get<AboutData>(ABOUT_URL);
}