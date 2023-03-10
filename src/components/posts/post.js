import * as React from "react"
import {Prose} from "../content/pros";
import {Fragment} from "react";
import {Link} from "gatsby";

export default function Post({post}) {
    return (
        <Fragment>
            <Prose className="mt-8">
                {post.frontmatter.link &&
                    <p>
                        Check out the <Link to={post.frontmatter.link} target="_blank">original article</Link>.
                    </p>
                }

                <section
                    dangerouslySetInnerHTML={{__html: post.html}}
                    itemProp="articleBody"
                />
            </Prose>
        </Fragment>
    )
}