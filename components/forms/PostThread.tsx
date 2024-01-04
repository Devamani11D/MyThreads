"use client"
import { Button } from "@/components/ui/button"
import * as z from 'zod';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createThread } from "@/lib/actions/thread.actions";
import { isBase64Image } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ThreadValidation } from "@/lib/validations/thread";
import { ChangeEvent, useState } from "react";
import { useUploadThing} from '@/lib/uploadthing';
//import { updateUser } from "@/lib/actions/user.actions";
import { usePathname,useRouter } from "next/navigation";
interface Props{
    user:{
        id:string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}





function PostThread({userId}:{userId:string}){

    const pathname=usePathname();
    const router=useRouter();
    const form= useForm<z.infer<typeof ThreadValidation>>({
        resolver: zodResolver(ThreadValidation),
        defaultValues:{
            thread:"",
            accountId:userId
        }
    });

    const onSubmit=async (values:z.infer<typeof ThreadValidation>)=>{
        await createThread({
            text:values.thread,
            author:userId,
            communityId:null,
            path:pathname
        });

        router.push('/');
    }
    return (
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} 
      className="flex flex-col justify-start gap-10 mt-10">

        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel className="text-base-semibold text-light-2">
            Content

              </FormLabel>
              <FormControl>
                <Textarea
                rows={15}
                className="no-focus border border-dark-4 bg-dark-3 text-light-1" 
                {...field}/>
              </FormControl>
              
              <FormMessage/>
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">PostThread</Button>

      </form>
      </Form>
    )
}

export default PostThread;