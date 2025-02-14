import React from "react";
import { Link } from "react-router-dom";
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Sub from "./Sub";

function HomePage() {
    return (
        <div className=" rounded-2xl  flex flex-col items-center">
            <div className="w-80 flex items-center sm:w-[600px] md:w-[700px] lg:w-[900px] xl:w-[1100px] rounded-2xl overflow-hidden h-[350px] bg-[url('https://metro.co.uk/wp-content/uploads/2022/08/GettyImages-1344972184-e1661260282529.jpg?quality=90&strip=all&zoom=1&resize=480%2C295')] bg-cover bg-center">
               
                <div className=" gap-10 px-3 py-1 w-[200px] xl:w-[400px]  rounded-md text-3xl  flex flex-col justify-center items-center font-medium text-white hover:text-indigo-500m  ml-44 sm:ml-96 md:ml-[450px] lg:ml-[550px] xl:ml-[670px]">
                
                <h2 className="text-black  flex flex-col items-center justify-center lg:w-[400px] lg:text-3xl xl:text-3xl">Be a Voice for the Voiceless</h2>
                <Link to="/Report" className="px-3 py-1 rounded-md text-3xl w-[120px] font-medium text-white hover:text-indigo-500m  bg-green-500">
                    Report
                </Link>

                </div>

            </div>
            <div className="flex flex-col items-center">
                <div class=" flex w-screen justify-center text-white rounded-3xl mt-10 mb-10">

                    <h1 class="text-6xl text-black font-bold mt-2 max-lg:flex max-lg:flex-col max-lg:items-center">PROTECTING<b className="text-yellow-300 max-sm:flex justify-center "> OUR </b>VOICELESS </h1>
                    {/* <p class="text-2xl">We are dedicated to the welfare of stray and abandoned animals.</p> */}
                </div>

                {/* <!-- Services Section --> */}
                <div class="py-16 max-w-7xl rounded-2xl px-4 sm:px-6 lg:px-8 bg-gray-400">
                    <div class="max-w-7xl mx-auto ">
                        <h2 class="text-4xl font-bold text-center mb-12">WHAT WE DO</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 class="text-2xl font-semibold mb-4">Sterilization & Vaccination</h3>
                                <p class="text-gray-700">Controlling the population of stray animals through humane sterilization and vaccination drives, preventing the spread of diseases.</p>
                            </div>
                            <div class="bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 class="text-2xl font-semibold mb-4">Emergency Rescue</h3>
                                <p class="text-gray-700">Providing critical rescue services for animals in distress, whether injured in accidents or abandoned by their owners.</p>
                            </div>
                            <div class="bg-gray-50 p-6 rounded-lg shadow-lg">
                                <h3 class="text-2xl font-semibold mb-4">Medical Care & Rehabilitation</h3>
                                <p class="text-gray-700">Our state-of-the-art facility offers essential medical care, surgeries, and rehabilitation to help animals recover and thrive.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage