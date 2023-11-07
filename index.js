const navbar={
    logo:document.getElementById("logo"),
    apps:document.getElementById("apps"),
    op2:document.getElementById("option2"),
    op3:document.getElementById("option3"),
    account:document.getElementById("account")
};
const links={
    logo:"",
    apps:"./pages/gamePage/gamePage.html",
    op2:"",
    op3:"",
    account:""
};
navbar.apps.addEventListener("click", button => {
    frame=document.getElementById("frame");
    console.log(frame);
    frame.src=links.apps;
    
});