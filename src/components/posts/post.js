import * as React from "react"
import {Prose} from "../content/pros";

export default function Post({post}) {
    return (
        <Prose className="mt-8">
            <section
                dangerouslySetInnerHTML={{__html: post.html}}
                itemProp="articleBody"
            />
        </Prose>
    )
}