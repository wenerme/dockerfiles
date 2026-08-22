case $- in
  *i*) ;;
  *) return ;;
esac

if [ -r /etc/bash/bashrc ]; then
  . /etc/bash/bashrc
fi

HISTCONTROL=ignoreboth
HISTSIZE=10000
HISTFILESIZE=20000
shopt -s cdspell checkwinsize histappend nocaseglob

for option in autocd globstar; do
  shopt -s "${option}" 2>/dev/null
done
unset option

export PS1="\[\e[32m\]\u@\h \[\e[01;33m\]\w \[\e[34m\][\t] \[\e[0m\]\n\$ "
