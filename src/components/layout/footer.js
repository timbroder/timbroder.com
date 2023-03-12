import * as React from "react"
import {graphql, Link, useStaticQuery} from "gatsby";
import getNavData from "../../utils/getNavData";
import {Container} from "./container";


export default function Footer() {
    const navItems = getNavData().site.siteMetadata.nav
    const author = useStaticQuery(graphql`
            query FooterQuery {
              site {
                siteMetadata {
                  author {
                    name
                    since
                  }
                }
              }
            }
          `).site.siteMetadata.author

    function NavLink({href, isActive = false, children}) {
        return (
            <Link
                to={href}
                className="transition hover:text-teal-500"
            >
                {children}
            </Link>
        )
    }

    return (
        <footer className="mt-32">
            <Container.Outer>
                <div className="border-t border-zinc-100 pt-10 pb-16">
                    <Container.Inner>
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex gap-6 text-sm font-medium text-zinc-800">
                                {navItems.map((item) => (
                                    <NavLink
                                        href={item.slug}
                                        key={item.slug}
                                    >
                                        {item.title}
                                    </NavLink>
                                ))}
                            </div>
                            <p className="text-sm text-zinc-400">
                                &copy; {author.since} - {new Date().getFullYear()} {author.name}. All rights
                                reserved.
                            </p>
                        </div>
                    </Container.Inner>
                </div>
            </Container.Outer>
        </footer>
    )
}