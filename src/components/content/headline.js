import * as React from "react"

export default function Headline({children, padded = true}) {
    return (
        <h1 className={`${padded ? 'mb-6 ' : ''}text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl`}>
            {children}
        </h1>
    )
}