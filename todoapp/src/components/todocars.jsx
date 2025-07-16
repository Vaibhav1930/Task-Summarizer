import React, { useState } from 'react'
import { MdDeleteOutline } from "react-icons/md";
import Loader from './loader';

function todocars({title,handleDelete,id}) {
    let[deletestatus,setDeletestatus]=useState(false)
    function handleDeleteClick(){
        setDeletestatus(true);
        handleDelete(id)
    }
  return (
    <div className="border rounded-lg box-border p-3 mt-2 flex justify-between items-center">
        <h2 className="text-neutral-800 font-semibold">{title}</h2>
        <button onClick={handleDeleteClick} className='text-neutral-600 hover:text-red-700'>{deletestatus?<Loader/>:<MdDeleteOutline />}</button>
    </div>
  )
}

export default todocars;
