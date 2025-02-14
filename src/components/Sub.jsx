import React from "react";
import { Link } from "react-router-dom";

function Sub() {
    return (
        <div className="flex flex-col items-center">
        <div className=" px-10 w-[200px] h-[200px] rounded-[50%] bg-green-300 shadow-dashBoardCardImageShadow flex text-Black items-end justify-center text-[7rem] ">✓</div>
        <p className="text-center text-opacity-90 text-2xl font-breeSerif drop-shadow-2xl tracking-widest font-bold">Your report has been submitted successfully. </p>
            <div className="flex flex-row items-center w-[130px] h-[50px] rounded-lg text-2xl bg-red-200 justify-center gap-4  mt-20">
                <Link to="/">
                    Home
                </Link>
            </div>
        </div>

    )
}

export default Sub