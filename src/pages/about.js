import * as React from "react"
import Layout from "../components/layout/layout";
import {StaticImage} from "gatsby-plugin-image";
import {
    InstagramIcon,
    MastodonIcon,
    GithubIcon,
    LinkedInIcon,
    GoodreadsIcon,
    PlaystationIcon, LastFmIcon, TraktIcon, RedditIcon
} from "../components/socials";
import {Container} from "../components/layout/container";
import clsx from 'clsx'
import {Link} from "gatsby";
import {Fragment} from "react";
import Seo from "../components/seo";

function SocialLink({ className, href, children, icon: Icon }) {
    return (
        <li className={clsx(className, 'flex')}>
            <Link
                href={href}
                className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500"
                target="_blank"
            >
                <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
                <span className="ml-4">{children}</span>
            </Link>
        </li>
    )
}

export const Head = ({location}) => (
    <Fragment>
        <Seo
            title="About - Tim Broder"
            description="I'm Tim Broder. I live just north of New York City, where I build things and play"
            pathname={location.pathname}
        />
    </Fragment>
)

const About = ({ location }) => {
    return (
        <Layout location={location}>
            <Container className="mt-16 sm:mt-32">
                <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
                    <div className="lg:pl-20">
                        <div className="max-w-xs px-2.5 lg:max-w-none">
                            <StaticImage
                                formats={["auto", "webp", "avif"]}
                                src="../images/avatar.png"
                                width={1024}
                                height={1024}
                                quality={100}
                                alt="Profile picture"
                                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover"
                            />
                        </div>
                    </div>
                    <div className="lg:order-first lg:row-span-2">
                        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl">
                            I’m Tim Broder. I live just north of New York City, where I build things and play.
                        </h1>
                        <div className="mt-6 space-y-7 text-base text-zinc-600">
                            <p>
                                I've loved making things with tech for as long as I can remember. I got my start playing with MS paint when I was 8 years old on my dad’s windows 3.1 machine. I built my first website (a Final Fantasy 7 fan site) on Geocities in 8th grade. I had only “been on the internet” for a few months at that point, and mostly at friends' houses. I remember thinking HOLY SH*T I can MAKE this myself?!?! Fast forward 6 months and I was competing in the ThinkQuest website competition through my school. I knew then that I wanted to get a “Ph. D. in web design”
                            </p>
                            <p>
                                Fast forward, and while I didn’t quite get that Ph. D., I did get a great degree and have loved every job I’ve had since graduating college. I loved living in New York City and having lots of side projects to keep me busy. I had lots of time to read comics and binge-watch TV
                            </p>
                            <p>
                                Coming to the present day, I’m a husband and a father of two. I have less time these days for side projects and TV but I still have a lot of fun. After 14 years, I’m still doing Crossfit, 3 days a week, and taking the boys to school on the other weekdays. I rediscovered video games after a long absence. Any spare time I used to have for TV has largely gone to that, but I still do both. I discovered Dungeons and Dragons, got a game going with some dear high school friends, and have been playing with my boys whenever I can.
                            </p>
                        </div>
                    </div>
                    <div className="lg:pl-20">
                        <ul role="list">
                            <SocialLink href="https://masto.ai/@timothybroder" icon={MastodonIcon}>
                                Follow on Mastodon
                            </SocialLink>
                            <SocialLink href="https://www.instagram.com/timothybroder/" icon={InstagramIcon} className="mt-4">
                                Follow on Instagram
                            </SocialLink>
                            <SocialLink href="https://github.com/timbroder" icon={GithubIcon} className="mt-4">
                                Follow on GitHub
                            </SocialLink>
                            <SocialLink href="https://www.linkedin.com/in/timbroder/" icon={LinkedInIcon} className="mt-4">
                                Follow on LinkedIn
                            </SocialLink>
                            <SocialLink href="https://www.reddit.com/user/broderboy/" icon={RedditIcon} className="mt-4">
                                Follow on Reddit
                            </SocialLink>
                            <SocialLink href="https://www.goodreads.com/user/show/1253891-tim-broder" icon={GoodreadsIcon} className="mt-4">
                                What I'm reading
                            </SocialLink>
                            {/*<SocialLink href="https://psnprofiles.com/SEPHROTH64" icon={PlaystationIcon} className="mt-4">*/}
                            <SocialLink href="https://www.exophase.com/user/timbroder/" icon={PlaystationIcon} className="mt-4">
                                What I'm playing
                            </SocialLink>
                            <SocialLink href="https://www.last.fm/user/broderboy/" icon={LastFmIcon} className="mt-4">
                                What I'm listening to
                            </SocialLink>
                            <SocialLink href="https://trakt.tv/users/timbroder" icon={TraktIcon} className="mt-4">
                                What I'm watching
                            </SocialLink>
                        </ul>
                    </div>
                </div>
            </Container>
        </Layout>
    )
}

export default About
