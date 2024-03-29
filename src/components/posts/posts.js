import * as React from "react"
import PostCard from "./postCard";

export default function Posts({posts: posts}) {
    return (
        <div className="md:border-l md:border-zinc-100 md:pl-6">
            <div className="flex max-w-3xl flex-col space-y-16">
                {posts.map((post) => (
                    <PostCard key={post.fields.slug} post={post}/>
                ))}
            </div>
        </div>
    )
}