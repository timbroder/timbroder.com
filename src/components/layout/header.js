import * as React from "react"
import {Fragment} from "react";
import {Link} from "gatsby";
import clsx from 'clsx'
import getNavData from "../../utils/getNavData";


export default function Header({location}) {
    const navItems = getNavData().site.siteMetadata.nav

    function NavItem({href, isActive = false, children}) {
        return (
            <li>
                <Link
                    to={href}
                    className={clsx(
                        'relative block px-3 py-2 transition',
                        isActive
                            ? 'text-teal-500'
                            : 'hover:text-teal-500 '
                    )}
                >
                    {children}
                    {isActive && (
                        <span
                            className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-teal-500/0 via-teal-500/40 to-teal-500/0"/>
                    )}
                </Link>
            </li>
        )
    }

    return (
        <Fragment>
            <div className="top-0 z-10 h-16 pt-6 flex flex-1 justify-center">
                <ul className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-zinc-800 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur">
                    {navItems.map((item) => (
                        <NavItem
                            href={item.slug}
                            key={item.slug}
                            isActive={location.pathname === item.slug || (item.slug === '/' && location.pathname.match(/^\/\d/))}
                        >
                            {item.title}
                        </NavItem>
                    ))}
                </ul>
            </div>
        </Fragment>
    )
}