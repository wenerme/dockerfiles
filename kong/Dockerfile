FROM kong:alpine

USER root
RUN cp /etc/kong/kong.conf.default /etc/kong/kong.conf && echo plugins=bundled >> /etc/kong/kong.conf

RUN luarocks install kong-plugin-acme && sed -i 's/^plugins.*/\0,acme/' /etc/kong/kong.conf
RUN luarocks install kong-plugin-url-replace && sed -i 's/^plugins.*/\0,url-replace/' /etc/kong/kong.conf
RUN luarocks install kong-plugin-upstream-auth-basic && sed -i 's/^plugins.*/\0,upstream-auth-basic/' /etc/kong/kong.conf

# need git
#RUN luarocks install kong-plugin-cookies-to-headers && sed -i 's/^plugins.*/\0,cookies-to-headers/' /etc/kong/kong.conf
#RUN luarocks install kong-plugin-jwt-keycloak && sed -i 's/^plugins.*/\0,jwt-keycloak/' /etc/kong/kong.conf

RUN echo anonymous_reports=off >> /etc/kong/kong.conf
USER kong
