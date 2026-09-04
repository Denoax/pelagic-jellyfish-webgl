#!/bin/sh
exec host-spawn /usr/bin/flatpak run --branch=stable --arch=x86_64 com.brave.Browser "$@"
