---
layout: post
title: Apiary Releases ‘World'S First’ Automated Api Ci Testing Service - The New Stack
date: 2015-08-22 10:45
link: http://thenewstack.io/apiary-releases-world-first-automated-api-ci-testing-service/
---

> Industrial API Model
> 
> This reflects Tung’s model which found that in the enterprise, API maturity often begins with an individual use case for an application or workflow which leads to the creation of a specific API within that use case department. But then, over the next six months or so, other parts of the enterprise take similar approaches to pilot projects quickly leading to a chaotic catalog of APIs that have been use-case built without a long term, industrial mindset for the agency’s broader needs. Accenture’s Industrial API model suggests that after the first couple of use cases demonstrate the power and efficacy of APIs, that future design be built using internal standards so that there is common nomenclature and endpoint descriptions for APIs, and that opening data sources and functionality via API is thought of in terms of wider potential uses rather than just a single use case.

We see this time and time again with our large enterprise clients. They either have one of two things. Hundreds of smaller APIs and services, with heavy overlap of functionality. "If you need this type of data, hit endpoint X, but if you need this one other enrichment field, hit this other endpoint. But that one isn't updated as frequently, so you really need to hit both, and do a merge or something on your end". There were a number of small teams, who needed data or a process, but didn't want to get tied up in a larger department initiative, and be tied to another teams timeline. So, they built their own to very specific use cases

The other case we see a lot, is a large company trying to unify all of their APIs and data, but going about it in the wrong way. They are tying all the systems to a large initiate and building a god system. A project like this usually spans years, and by the time you get to the end of it, the earlier changes are already out of date. 

Part of the work we do with clients like this is to get the teams to agree on a unified API language first, then start converting different systems one by one. As we identify overlap, we will role those systems together. That transformation or merging should be transparent to anything consuming from those systems. 

We do this for a number of reasons. First and foremost is so we can get user facing changed out faster. Get the new site, or tool public so we can begin testing it against real users. Then, if we need to make UI changes, we aren't locked down to a back office system. That is all behind an API that we helped define, and can assume won't change for a while. We can iterate faster, while the back office systems continue on their slower timelines