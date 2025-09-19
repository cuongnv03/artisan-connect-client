# Artisan Connect - Client

## 📝 Overview

**Artisan Connect** is a Social Commerce platform built to fully integrate features that allow artisans to both create content and sell their handmade products. The project addresses the growing need for digitization among artisans and fills the gap for a specialized platform that combines social media with e-commerce in Vietnam.

---

## ✨ Key Features

The platform provides a comprehensive feature set for both buyers and sellers:

* **Social Interaction**: Customers can follow artisans and interact with posts (likes, comments).
* **Content Creation**: Artisans can publish blog-style content to share stories and their creative process.
* **Product Shopping**: Customers can browse, search for, and purchase handmade products.
* **Artisan Management**: Provides professional tools for managing products and orders.
* **Flexible Pricing**: A unique system that allows for price negotiation and custom order requests.
* **Real-time Communication**: Integrated real-time notification and messaging system to enhance interaction.

---

## 📸 Screenshots

Here are the main interfaces of the application.

### General & Customer Interfaces

* **Homepage (Logged Out)**
    * ![Homepage (Logged Out)](https://github.com/user-attachments/assets/07416177-c4d2-4222-9d9b-a11b8836c259 "Homepage for users who are not logged in, introducing the platform")
* **Homepage (Logged In)**
    * ![Homepage (Logged In)](https://github.com/user-attachments/assets/2c369d70-389e-4084-adbb-9940d4e18cb9 "Personalized homepage showing a feed of posts from followed artisans and discovery shortcuts")
* **Discover Page**
    * ![Discover Page](https://github.com/user-attachments/assets/605021dd-fe64-413f-bb98-52ad0947144c "Discover page with a search bar and featured categories")
* **Store Page**
    * ![Store Page](https://github.com/user-attachments/assets/1b1c1929-f30d-428a-9187-506342e11915 "Store interface displaying products with filtering options")
* **Post Details**
    * ![Post Details](https://github.com/user-attachments/assets/0fddf271-6c79-4c6a-8036-cc63f663b9dd "Modal window showing the detailed content of a post")
* **Product Details**
    * ![Product Details](https://github.com/user-attachments/assets/c9d2473e-4aef-4b01-916c-0ce1b5480557 "Page showing the product's information, images, price, and detailed description")
* **Ordering Process**
    * ![Ordering Process 1](https://github.com/user-attachments/assets/f3a2171f-5304-42f8-8d69-29fe15a6135f "Shopping cart interface")
    * ![Ordering Process 2](https://github.com/user-attachments/assets/b27e4967-ad01-4077-85de-e2bb2d5b807e "Checkout page with address and payment method information")
    * ![Ordering Process 3](https://github.com/user-attachments/assets/2e14aa3f-3341-41b8-9a05-102bcf636b18 "Order details interface after a successful order")
* **Become an Artisan Request**
    * ![Become an Artisan Request 1](https://github.com/user-attachments/assets/4d3c6356-86cd-4240-823e-9e8c2cb87e93 "Page introducing the benefits and starting the request process")
    * ![Become an Artisan Request 2](https://github.com/user-attachments/assets/53cc1ba1-7565-4f2d-87de-883c55828448 "Detailed form for applying to become an artisan and Confirmation screen after successfully submitting the request")

### Artisan Interfaces

* **Post Management**
    * `[Image: Interface listing all posts created by the artisan]`
* **Create New Post**
    * `[Image: Editor for creating a new post]`
* **Product Management**
    * `[Image: Dashboard for managing all products in the store]`
* **Create New Product**
    * `[Image: Detailed form for adding a new product]`
* **Sales Order Management**
    * `[Image: Interface for tracking and managing sold orders]`
* **Custom Order Management**
    * `[Image: Interface for managing custom order requests from customers]`
* **Price Negotiation Management**
    * `[Image: Interface for managing price negotiation requests]`
    * `[Image: Form for a customer to start a price negotiation]`
    * `[Image: Interface for an artisan to respond to a negotiation request]`
    * `[Image: Notification of a successful negotiation with an option to add to cart]`
* **Interface Customization**
    * `[Image: Initial state of the personal profile page]`
    * `[Image: Selecting a template and previewing the changes]`
    * `[Image: Interface after saving and applying a new color scheme]`

### Admin Interface

* **Artisan Upgrade Request Management**
    * `[Image: Page for managing and approving requests to become an artisan]`

---

## 💻 Tech Stack

* **Frontend**: React, HTML, CSS, Tailwind CSS.
* **Real-time Data Transfer**: Socket.io.

---

## 🚀 Getting Started

### Prerequisites
* Node.js 16+ and npm/yarn
* Git

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-organization/artisan-connect-client.git](https://github.com/your-organization/artisan-connect-client.git)
    cd artisan-connect-client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variable to connect to the backend:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```

4.  **Start the development server:**
    ```bash
    npm start
    ```
    The application will be running at `http://localhost:3000`.
