all: npminstall link

npminstall:
	cd submodules && ./npm-install.sh && cd ..

link:
	cd submodules/ipfs-cli && npm link
