# 😼 Simple Cat Bot for Facebook Messenger 😼

This is a very simple bot for Facebook Messenger. It's a beta, it works fine but I need to improve a lot of things. Use it, test it, play with it, share it, do what you want.

## *How to install it*

I assume you know how to use node so I'll not write a complete tutorial but just some basic steps.

1. You need a node server (Heroku and AWS works fine)
2. Create a new Facebook App here https://developers.facebook.com/apps/ and choose *Apps for Messenger* in the **Category**.

![Alt text](/screenshots/screen1.jpg)

3. In the Facebook App go to the *Messenger* tab and then click on *Setup Webhook*. Your **Callback URL** will be for example *https://server.com/webhook* (your server must have a SSL certificate signed by a valid certificate authority). Your **Verify Token** is what you want. For example `use_the_force_luke`. Also, make sure to check the same Subscription Fields.

![Alt text](/screenshots/screen2.jpg)

4. Click *Verify and Save*. If everything is fine, you can go to the next step. If not, Facebook will tell you where you failed.
5. Now you need to generate a Page Access Token. Save it somewhere. You'll need it later. Good to know, your generated token will **NOT** be saved in this UI. Each time you select that Page a new token will be generated. However, any previous tokens created will continue to function.

![Alt text](/screenshots/screen2.jpg)

When you're done, go back to the **Webhooks** section and subscribe your webhook to your page.
You can also do this in a terminal :
```bash
curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<YOUR_PAGE_ACCESS_TOKEN>"
```

6. In the `config/` folder, modify your settings

* appSecret : retrieve it in your Facebook App Dashboard.
* pageAccessToken: the page token you saved earlier (it's a very long key)
* validationToken: this is your *Verify Token*. In our example `use_the_force_luke`

There you go 😺 Your bot is ready.

## 🙊 How to interact with it?

The bot will interact with you depending on what you say. In the future I will add more interactions and conditions but for now, if you say anything, the bot will return your message and the correct command.

If you want cat pictures, the command is `cat category format`

* cat: the keyword that ask for a cat picture
* category: the category based on thecatapi.com. Here is the [complete list ](http://thecatapi.com/api/categories/list). Some categories doesn't work so I've made a good const in the app : `const validCategory = ['hats', 'space', 'sunglasses', 'boxes', 'caturday', 'ties', 'dream', 'sinks', 'clothes'];`
* format: jpg, png or gif

**Request example:** cat space gif

## 💡 Useful links

* This bot uses http://thecatapi.com to find cat images. Go check the [documentation](http://thecatapi.com/docs.html) to see how it works.
* [Messenger Platform Doc](https://developers.facebook.com/docs/messenger-platform)
* [Express documentation](http://expressjs.com/)

## ☕️ TODO

* ✅ Remove jshint > Try ESLint
* ✅ Add a `help` command
* ✅ Add an answer if the user send an image to the bot
* [] Refactoring
  * [] Modules
  * ✅ Lodash
* [] Add more interactions
* [] Add a Greeting Text containing the bot features
* [] Add a real `postback` feature like "Another cat"

## ⚛ Contributing

I'm still pretty new to node environment so feel free to make pull requests or send an issue if you want to improve this bot or fix errors. As I said this bot is a beta and I have a lot of stuff to fix.
