apt update

apt install -y gcc g++ python3 pip rustc cargo make cmake python3-dev python3-venv

# rustup
# curl https://sh.rustup.rs -sSf | sh

pip install --upgrade pip

# torchvision torchaudio
# matplotlib nltk pandas scikit-learn scipy seaborn tqdm jupyterlab keras tensorflow
pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
pip install --no-cache-dir tensorflow keras numpy

# python3 -c "import tensorflow as tf;print(tf.reduce_sum(tf.random.normal([1000, 1000])))"
# python3 -c "import torch; print(torch.__version__)"

apt-get clean
rm -rf /root/.cache/pip
rm -rf /var/lib/apt/lists/*
rm -f "$0"
