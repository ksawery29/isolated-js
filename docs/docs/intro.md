---
sidebar_position: 1
title: ✨ Welcome to Isolated JS 
description: Welcome!
keywords: [isolated, js, javascript, library, isolatedjs, sandbox, isolated environment]
slug: /
---

# ✨ Welcome to Isolated JS 

## What is IsolatedJS?
IsolatedJS is a JavaScript library for the web that allows you to create isolated JavaScript environments. It is a lightweight library that provides a simple API to create and manage isolated JavaScript environments. It is useful for creating sandboxes, running untrusted code, and more.
It is heavily based on iframes and the `window.postMessage` API.

## Is it really secure?
Honestly, I dont know. Its based on sandboxed iframes and the `window.postMessage` API. It should be secure, but I cannot guarantee it. Use at your own risk.
Since really its just a fancy iframe wrapper, as long as iframes are secure, this should be secure too.

## Features
- **Isolated Environment**: IsolatedJS creates a separate environment for each instance, which means that the code running in one instance cannot access the code running in another instance.
- **Sandboxing**: IsolatedJS provides a way to run untrusted code in a secure environment.
- **Lightweight**: IsolatedJS is a lightweight library with no dependencies.
- **Simple API**: IsolatedJS provides a simple API to create and manage isolated environments.

## Installation
See the [Installation](installation) page for instructions on how to install IsolatedJS.