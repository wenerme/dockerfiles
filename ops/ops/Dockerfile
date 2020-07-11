FROM wener/base

# tig fzf fzf-tmux fzf-vim \
RUN apk add --no-cache \
      # network
      iftop iproute2 bind-tools \
      # system
      htop procps util-linux \
      # devs
      git jq tmux vim \
      # remote
      openssh \
      # ansible
      python3 py3-pip ansible autossh sshpass \
      # docker
      docker py3-dockerpty py3-cryptography

# terraform
