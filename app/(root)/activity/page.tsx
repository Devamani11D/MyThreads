import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import { getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";

const Page=async ()=>{
    const user=await currentUser();
    if(!user)
    return null;

    const userInfo=await fetchUser(user.id);
    if(!userInfo?.onboarded)redirect('/onboarding');

    const activity=await getActivity(userInfo._id);


    return (
      <section>
        <h1 className="head-text mb-10">Activity</h1>
        <section className="mt-10 flex flex-col gap-5">
          {activity.length>0?(
            <>
            {activity.map((activity)=>{
              return 
              (
                <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                  <article className="activity-card">
                    <Image 
                    src={activity.author.image}
                    alt="profile_picture"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                    />
                    <p className="!test-small-regular text-light-1">
                      <span className="mr-1 text-primary-500">
                        {activity.author.name
                        }
                      </span>{" "}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              )
            })}
            </>)
            :
              <>
              <div>
                <h1 className="text-light-2 !text-base-regular">No activity</h1>
              </div>
              </>
}
          
        </section>
      
      </section>
    )
  }
  
  export default Page;
  