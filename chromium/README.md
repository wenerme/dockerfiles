
# wener/chromium

```
# installed version
docker run --rm -it wener/chromium chromium-browser --version

# start, view in browser
docker run --rm -it -p 5901:5901 --name chromium wener/chromium
```

Visit https://novnc.com/noVNC/vnc.html?host=localhost&port=5901&path=&encrypt=0 to access the VNC
