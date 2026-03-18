---
description: "This rule provides the context for the application"
alwaysApply: true
---

# What it is

## Primary concept
This application is going to serve as a task scoring system for projects that use (mainly) scrum for tasks.
The main goal is to create a session and be able to invite people from my team to participate at a scoring session and that session can stay active as long as the owner wants, without any specific duration time limit.

## Scoring system
The industry standard is to use the fibonnaci sequence (1, 2, 3, 5, 8, 13, 21, 34, 55, 89), but i also want it to be configurable per scoring session, with some predefine patterns such as (RN, PP, P, M, G, GG, XGG) or anything that the session owner wants.

## Auth
Authentication is not needed at all, session owners will share a link to their session and only with a name a person can join that session.
The owner is also capable of adding 'view-only' participants or turn participants as view-only anytime, those participants will not score at all but will be able to see what is going on the current session.
