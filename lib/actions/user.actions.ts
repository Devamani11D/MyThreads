"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import { communityTabs } from "@/constants";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
interface Params{
    userId: string,
    username:string,
    image:string,
    bio:string,
    name:string,
    path:string
}
export async function updateUser({
    userId,
    username,
    image,
    bio,
    name,
    path
}:Params):Promise<void>{
    connectToDB();

    try{
    await User.findOneAndUpdate({id:userId},{
        username:username.toLowerCase(),
        name,
        bio,
        image,
        onboarded:true
    },{
        upsert:true//update if exists otherwise inserts
    });
    if(path=='/profile/edit'){
        revalidatePath(path);
    }
}
catch(error:any){
    throw new Error(`Failed to create/update user:${error.message}`);
}
}


export async function fetchUser(userId:string)
{
    try{
        connectToDB();
        return await User.findOne({id:userId});
        /* .populate({path:'communities',
        // model:Community});*/

    }catch(error:any){
        throw new Error(`Failed to fetch User:${error.message}`);
    }
}

export async function fetchUserPosts(userId:string){
    try{
        connectToDB();

        //To Do:populate community
        const threads=await User.findOne({id:userId}).populate({
            path:'threads',
            model:Thread,
            populate:{
                path:'children',
                model:Thread,
                populate:{
                    path:'author',
                    model:User,
                    select:"name image id"
                }
            }
        })

        return threads;
    }
    catch(error:any){
        throw new Error(`Error fetching user posts:${error.message}`);
    }
}

export async function fetchUsers({userId,
pageNumber=1,
pageSize=10,
searchString="",
sortBy="desc"
}:{
    userId:string,
    searchString?:string,
    pageNumber?:number,
    pageSize?:number,
    sortBy?:SortOrder

}){
    try{
        connectToDB();
        const skipAmount=(pageNumber-1)*pageSize;

        const regex=new RegExp(searchString,"i");

        const query:FilterQuery<typeof User>={
            id:{$ne:userId}
        }
        if(searchString.trim()!=='')
        {
            query.$or=[
                {username:{$regex:regex}},
                {name:{$regex:regex}}
            ]
        }

        const sortOptions={createdAt:sortBy};

        const usersQuery=User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);


        const totalUsersCount=await User.countDocuments(query);

        const users=await usersQuery.exec();

        const isNext=totalUsersCount>skipAmount+users.length;

        return {users,isNext};
    }catch(error:any){
        throw new Error(`Failed to fetch users:${error.message}`);
    }
}


export async function getActivity({userId}:{userId:string}){
    try{
        connectToDB();

        //find threads created by user
        const userThreads=await Thread.find({author:userId});

            const childThreads=userThreads.reduce((acc,userThread)=>{
                return acc.concat(userThread.children)
            },[]);

            const replies=await Thread.find({_id:{$in:childThreads},
            author:{$ne:userId}}).populate({
                path:'author',
                model:User,
                select:'name image _id'
            })
            return replies;


    }catch(error:any){
        throw new Error(`Error fetching activity:${error.message}`);
    }
}