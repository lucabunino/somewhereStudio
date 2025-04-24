<script>
import { register } from 'swiper/element/bundle';register();
let { slides } = $props()
</script>

<swiper-container
pagination="true"
>
{#each slides as quote, j}
  <swiper-slide class="text">
    <h4 class="gaisyr-34">{quote.quotation}</h4>
    <h5 class="ronzino-18">{quote.author.title}</h5>
  </swiper-slide>
{/each}
</swiper-container>

<style>
/* Quote */
.text {
  padding: var(--gutter) calc(var(--gutter)/2);
}
.text > * {
  text-indent: calc(var(--gutter)*6);
}
.text > h4::before {
  content: "\2018";
}
.text > h4::after {
  content: "\2019";
}
.text > h5 {
  margin-top: 1em;
}
swiper-container::part(container) {
  overflow-x: clip;
  overflow-y: visible;
}
swiper-container::part(pagination) {
  font-size: .857rem;
  text-align: left;
  padding: .5em;
  width: -webkit-fill-available;
  bottom: -2.166em;
}
swiper-container::part(bullet), swiper-container::part(bullet-active) {
  width: 1em;
  height: 1em;
  background-color: var(--darkGray);
}
</style>
