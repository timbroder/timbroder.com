import * as React from "react"
import {Prose} from "../content/pros";
import {Fragment} from "react";
import {Link} from "gatsby";
import renderContentfulRichText from "../../utils/render-rich-text";

export default function Post({post, source = 'markdown'}) {
    // Get the link field based on source
    const link = source === 'markdown' ? post.frontmatter?.link : post.link

    return (
        <Fragment>
            <Prose className="mt-8">
                {link &&
                    <p>
                        Check out the <Link to={link} target="_blank">original article</Link>.
                    </p>
                }

                {source === 'markdown' ? (
                    <section
                        dangerouslySetInnerHTML={{__html: post.html}}
                        itemProp="articleBody"
                    />
                ) : (
                    <section itemProp="articleBody">
                        {renderContentfulRichText(post.content)}
                    </section>
                )}
            </Prose>
        </Fragment>
    )
}
