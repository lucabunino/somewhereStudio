export default `
.swiper-button-next,
.swiper-button-prev {
	background-color: var(--white);
	background-position: center;
	background-size: 10px;
	background-repeat: no-repeat;
	border-radius: 100%;
	width: 40px;
	height: 40px;
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.3));
	z-index: 9999;
	cursor: pointer;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
	background-color: var(--lightGray);
}

.swiper-button-prev {
	left: var(--gutter);
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='34' viewBox='0 0 20 34'%3E%3Cpath d='M0 16.977 14.007 0H20L5.955 16.977 20 34h-5.993L0 16.977Z' fill='var(--black)'/%3E%3C/svg%3E");
}

.swiper-button-next {
	right: var(--gutter);
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='34' viewBox='0 0 20 34'%3E%3Cpath d='M20 16.977 5.993 34H0l14.045-16.977L0 0h5.993L20 16.977Z' fill='var(--black)'/%3E%3C/svg%3E");
}

.swiper-button-next svg,
.swiper-button-prev svg {
	display: none;
}

.swiper-button-disabled {
	pointer-events: default;
	opacity: .2;
}
`;