const NAVIGATION = `<ul class="nav">
    {{#each navigation}}
    <li class="{{link_class for=(url) class=(concat "nav-" slug)}}"><a href="{{url absolute="true"}}">{{label}}</a></li>
    {{/each}}
</ul>`;
export default NAVIGATION;
