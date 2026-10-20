using Application.Common.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task InitializeAsync(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ILogger logger)
    {
        try
        {
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }

            // Seed Users if not present
            if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Seeding users and admins...");

                // 3 Admins
                var superAdmin = new User
                {
                    Email = "admin@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("Admin123!"),
                    FullName = "Головний Адміністратор",
                    PhoneNumber = "+380501112233",
                    Role = UserRole.Admin
                };

                var contentModerator = new User
                {
                    Email = "moderator@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("Admin123!"),
                    FullName = "Модератор Контенту",
                    PhoneNumber = "+380502223344",
                    Role = UserRole.Admin
                };

                var techAdmin = new User
                {
                    Email = "tech_admin@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("Admin123!"),
                    FullName = "Технічний Адміністратор",
                    PhoneNumber = "+380503334455",
                    Role = UserRole.Admin
                };

                // Regular sellers & buyers
                var sellerUser = new User
                {
                    Email = "user@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("User123!"),
                    FullName = "Олександр Коваленко",
                    PhoneNumber = "+380674445566",
                    Role = UserRole.User
                };

                var buyerUser = new User
                {
                    Email = "buyer@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("Buyer123!"),
                    FullName = "Максим Шевченко",
                    PhoneNumber = "+380931118899",
                    Role = UserRole.User
                };

                var electricSeller = new User
                {
                    Email = "olena@autolib.com",
                    PasswordHash = passwordHasher.HashPassword("User123!"),
                    FullName = "Олена Мельник",
                    PhoneNumber = "+380667778899",
                    Role = UserRole.User
                };

                context.Users.AddRange(superAdmin, contentModerator, techAdmin, sellerUser, buyerUser, electricSeller);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeding rich cars catalog...");

                var cars = new List<Car>
                {
                    // 1. BMW 3 Series (Approved)
                    new Car
                    {
                        Title = "BMW 3 Series M Sport 2022",
                        Brand = "BMW",
                        Model = "3 Series",
                        Year = 2022,
                        Price = 38500,
                        Mileage = 32000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.0,
                        City = "Київ",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Офіційний автомобіль у бездоганному стані. Куплений в автосалоні в Києві, обслуговувався виключно на офіційному сервісі AWT Bavaria. Пакет M Sport, лазерні фари, комфортний безключовий доступ, шкіряний салон Vernasca, проекційний дисплей на лобове скло, топова аудіосистема Harman/Kardon.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", IsPrimary = true },
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80", IsPrimary = false }
                        }
                    },

                    // 2. Audi RS6 (Approved)
                    new Car
                    {
                        Title = "Audi RS6 Avant Quattro 2021",
                        Brand = "Audi",
                        Model = "RS6",
                        Year = 2021,
                        Price = 89000,
                        Mileage = 45000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 4.0,
                        City = "Львів",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Ідеальний універсал на 600 к.с. Карбоно-керамічні гальма, панорамний дах, пневмопідвіска, спортивний вихлоп RS з регульованими заслінками, система нічного бачення, камери 360 градусів. Весь кузов у захисній бронеплівці SunTek.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80", IsPrimary = true },
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", IsPrimary = false }
                        }
                    },

                    // 3. Tesla Model 3 (Approved)
                    new Car
                    {
                        Title = "Tesla Model 3 Long Range Dual Motor 2023",
                        Brand = "Tesla",
                        Model = "Model 3",
                        Year = 2023,
                        Price = 34500,
                        Mileage = 18000,
                        FuelType = FuelType.Electric,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 0.0,
                        City = "Одеса",
                        Status = CarStatus.Approved,
                        UserId = electricSeller.Id,
                        Description = "Європейська офіційна версія з повним приводом. Запас ходу до 580 км (WLTP). Преміум аудіосистема, пакет автопілоту FSD активовано, тепловий насос, подвійне скло для ідеальної шумоізоляції. Стан нового авто з салону.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80", IsPrimary = true },
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1571127236794-81c1c2105151?auto=format&fit=crop&w=1200&q=80", IsPrimary = false }
                        }
                    },

                    // 4. Porsche 911 (Approved)
                    new Car
                    {
                        Title = "Porsche 911 Carrera 4S 2020",
                        Brand = "Porsche",
                        Model = "911",
                        Year = 2020,
                        Price = 115000,
                        Mileage = 28000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 3.0,
                        City = "Київ",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Кузов 992. Спортивна вихлопна система, пакет Sport Chrono, адаптивна спортивна підвіска PASM (-10мм), матричні світлодіодні фари PDLS Plus, 18-позиційні сидіння Plus. Гаражне зберігання, лише суха літня експлуатація.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 5. Mercedes-Benz E-Class (Approved)
                    new Car
                    {
                        Title = "Mercedes-Benz E 300 d AMG Line 2021",
                        Brand = "Mercedes-Benz",
                        Model = "E-Class",
                        Year = 2021,
                        Price = 52000,
                        Mileage = 60000,
                        FuelType = FuelType.Diesel,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.0,
                        City = "Дніпро",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Рестайлінгова модель. Дизельний 245 к.с. з м'яким гібридом EQ Boost (витрата палива 5.5 л/100км). Зовнішній та внутрішній AMG-пакет, панорамний дах, камери 360, бездротова зарядка, активний асистент паркування.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 6. Toyota RAV4 Hybrid (Approved)
                    new Car
                    {
                        Title = "Toyota RAV4 Hybrid Lounge AWD 2023",
                        Brand = "Toyota",
                        Model = "RAV4",
                        Year = 2023,
                        Price = 36800,
                        Mileage = 15000,
                        FuelType = FuelType.Hybrid,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.5,
                        City = "Харків",
                        Status = CarStatus.Approved,
                        UserId = buyerUser.Id,
                        Description = "Максимальна комплектація Lounge. Повний привід AWD-i, вентиляція передніх сидінь, підігрів керма та лобового скла, камери кругового огляду 360, акустика JBL. Вся передня частина заклеєна плівкою.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 7. Volkswagen Golf GTI (Approved)
                    new Car
                    {
                        Title = "Volkswagen Golf GTI Clubsport 2022",
                        Brand = "Volkswagen",
                        Model = "Golf",
                        Year = 2022,
                        Price = 29900,
                        Mileage = 39000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.0,
                        City = "Івано-Франківськ",
                        Status = CarStatus.Approved,
                        UserId = buyerUser.Id,
                        Description = "Легендарний хот-хетч на 300 к.с. Електронне блокування диференціалу XDS, спортивні ковші, цифрова панель Digital Cockpit Pro, матрична оптика IQ.Light, диски Adelaide R19.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 8. Hyundai Ioniq 5 (Approved)
                    new Car
                    {
                        Title = "Hyundai Ioniq 5 Long Range AWD 2023",
                        Brand = "Hyundai",
                        Model = "Ioniq 5",
                        Year = 2023,
                        Price = 41200,
                        Mileage = 22000,
                        FuelType = FuelType.Electric,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 0.0,
                        City = "Львів",
                        Status = CarStatus.Approved,
                        UserId = electricSeller.Id,
                        Description = "Батарея 77.4 кВт·год, 305 к.с. 800-вольтова архітектура ультрашвидкої зарядки (з 10 до 80% за 18 хвилин). Релаксаційні сидіння з підставкою для ніг, проєкція з доповненою реальністю (AR-HUD).",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1669894371465-983375b4260f?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 9. Ford Mustang GT (Approved)
                    new Car
                    {
                        Title = "Ford Mustang GT 5.0 V8 Manual 2019",
                        Brand = "Ford",
                        Model = "Mustang",
                        Year = 2019,
                        Price = 33000,
                        Mileage = 58000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Manual,
                        EngineCapacity = 5.0,
                        City = "Одеса",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Атмосферний 5.0 Coyote на 460 к.с. з 6-ступінчастою механічною КПП з автоматичним перегазуванням (Rev-Matching). Гальма Brembo 6-поршневі, активний випуск із регулюванням звуку, преміум звук Shaker Pro.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 10. Volvo XC90 (Approved)
                    new Car
                    {
                        Title = "Volvo XC90 T8 Recharge Inscription 2022",
                        Brand = "Volvo",
                        Model = "XC90",
                        Year = 2022,
                        Price = 64500,
                        Mileage = 42000,
                        FuelType = FuelType.Hybrid,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.0,
                        City = "Київ",
                        Status = CarStatus.Approved,
                        UserId = sellerUser.Id,
                        Description = "Plug-in гібрид на 455 к.с. 7 місць. Пневмопідвіска чотирьох коліс, кришталевий селектор Orrefors, масаж та вентиляція передніх сидінь, топова аудіосистема Bowers & Wilkins із режимом Гетеборзького концертного залу.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 11. Toyota Camry (Pending - для перевірки адміном)
                    new Car
                    {
                        Title = "Toyota Camry Hybrid 2.5 Premium 2021",
                        Brand = "Toyota",
                        Model = "Camry",
                        Year = 2021,
                        Price = 27800,
                        Mileage = 55000,
                        FuelType = FuelType.Hybrid,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 2.5,
                        City = "Дніпро",
                        Status = CarStatus.Pending,
                        UserId = buyerUser.Id,
                        Description = "Максимальна комплектація Premium. Надзвичайно економна (4.8 л на 100 км по місту). Вентиляція сидінь, шторки, адаптивний круїз-контроль, утримання в смузі, сліпі зони. Нове оголошення, очікує перевірки модератором.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 12. BMW X5 (Pending - для перевірки адміном)
                    new Car
                    {
                        Title = "BMW X5 xDrive40i M Sport 2023",
                        Brand = "BMW",
                        Model = "X5",
                        Year = 2023,
                        Price = 74000,
                        Mileage = 12000,
                        FuelType = FuelType.Petrol,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 3.0,
                        City = "Київ",
                        Status = CarStatus.Pending,
                        UserId = sellerUser.Id,
                        Description = "Офіційний рестайлінговий X5 G05 LCI. Вигнутий екран Curved Display (iDrive 8.5), пакет M Sport Pro з червоними супортами, пневмопідвіска, підсвітка решітки радіатора Iconic Glow.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 13. Audi Q8 (Pending - для перевірки адміном)
                    new Car
                    {
                        Title = "Audi Q8 50 TDI S-Line 2022",
                        Brand = "Audi",
                        Model = "Q8",
                        Year = 2022,
                        Price = 68500,
                        Mileage = 35000,
                        FuelType = FuelType.Diesel,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 3.0,
                        City = "Львів",
                        Status = CarStatus.Pending,
                        UserId = sellerUser.Id,
                        Description = "Дизель 3.0 TDI (286 к.с.). Повнокероване шасі (поворотна задня вісь), дотяжки дверей, подвійне атермальне скло, диски Audi Sport R22.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    },

                    // 14. Nissan Leaf (Rejected - демонстрація відхиленого оголошення)
                    new Car
                    {
                        Title = "Nissan Leaf Tekna 40kWh 2018",
                        Brand = "Nissan",
                        Model = "Leaf",
                        Year = 2018,
                        Price = 12500,
                        Mileage = 110000,
                        FuelType = FuelType.Electric,
                        Transmission = Transmission.Automatic,
                        EngineCapacity = 0.0,
                        City = "Вінниця",
                        Status = CarStatus.Rejected,
                        RejectionReason = "Неякісні фотографії салону, відсутній VIN-код та некоректно зазначений реальний SOH батареї.",
                        UserId = sellerUser.Id,
                        Description = "Електромобіль у гарному стані, батарея має 10 з 12 поділок. Салон комбінований, камери 360, підігрів усіх сидінь.",
                        Images = new List<CarImage>
                        {
                            new CarImage { ImageUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", IsPrimary = true }
                        }
                    }
                };

                context.Cars.AddRange(cars);
                await context.SaveChangesAsync();

                logger.LogInformation("Seeding reviews, favorites and real-time chat messages...");

                // Reviews
                var reviews = new List<Review>
                {
                    new Review
                    {
                        CarId = cars[0].Id,
                        UserId = buyerUser.Id,
                        Rating = 5,
                        Comment = "Оглядав автомобіль на сервісі в Києві. Стан відповідає опису, геометрія рівна, пробіг підтверджений офіційним дилером!"
                    },
                    new Review
                    {
                        CarId = cars[0].Id,
                        UserId = superAdmin.Id,
                        Rating = 5,
                        Comment = "Чесний продавець, всі документи в повному порядку."
                    },
                    new Review
                    {
                        CarId = cars[1].Id,
                        UserId = buyerUser.Id,
                        Rating = 5,
                        Comment = "RS6 — це просто космос! 600 сил відчуваються неймовірно, звук вихлопу дарує шалені емоції."
                    },
                    new Review
                    {
                        CarId = cars[2].Id,
                        UserId = buyerUser.Id,
                        Rating = 4,
                        Comment = "Гарне авто для міста, дуже плавна динаміка. Швидка зарядка працює ідеально."
                    },
                    new Review
                    {
                        CarId = cars[3].Id,
                        UserId = contentModerator.Id,
                        Rating = 5,
                        Comment = "Справжній спортивний характер Porsche. Стан салону та кузова як новий."
                    },
                    new Review
                    {
                        CarId = cars[4].Id,
                        UserId = buyerUser.Id,
                        Rating = 5,
                        Comment = "Неймовірно комфортний на трасі. Витрата 5.2 л на 100 км при швидкості 120 км/год."
                    }
                };

                context.Reviews.AddRange(reviews);

                // Favorites
                var favorites = new List<Favorite>
                {
                    new Favorite { UserId = buyerUser.Id, CarId = cars[0].Id },
                    new Favorite { UserId = buyerUser.Id, CarId = cars[1].Id },
                    new Favorite { UserId = buyerUser.Id, CarId = cars[3].Id },
                    new Favorite { UserId = superAdmin.Id, CarId = cars[1].Id }
                };

                context.Favorites.AddRange(favorites);

                // Chat Rooms & Messages
                var chatRoom1 = new ChatRoom
                {
                    CarId = cars[0].Id,
                    BuyerId = buyerUser.Id,
                    SellerId = sellerUser.Id
                };

                var chatRoom2 = new ChatRoom
                {
                    CarId = cars[2].Id,
                    BuyerId = buyerUser.Id,
                    SellerId = electricSeller.Id
                };

                context.ChatRooms.AddRange(chatRoom1, chatRoom2);
                await context.SaveChangesAsync();

                var messages = new List<ChatMessage>
                {
                    new ChatMessage
                    {
                        ChatRoomId = chatRoom1.Id,
                        SenderId = buyerUser.Id,
                        Content = "Доброго дня! Чи можна подивитися авто завтра на Подолі або Печерську?",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddHours(-3)
                    },
                    new ChatMessage
                    {
                        ChatRoomId = chatRoom1.Id,
                        SenderId = sellerUser.Id,
                        Content = "Вітаю, Максиме! Так, звісно. Давайте о 14:00 біля метро Контрактова площа, підійде?",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    },
                    new ChatMessage
                    {
                        ChatRoomId = chatRoom1.Id,
                        SenderId = buyerUser.Id,
                        Content = "Чудово! Підкажіть ще, зимовий комплект гуми йде в комплекті?",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-25)
                    },
                    new ChatMessage
                    {
                        ChatRoomId = chatRoom2.Id,
                        SenderId = buyerUser.Id,
                        Content = "Привіт, Олено! Який реальний запас ходу взимку при ввімкненій пічці?",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new ChatMessage
                    {
                        ChatRoomId = chatRoom2.Id,
                        SenderId = electricSeller.Id,
                        Content = "Привіт! Завдяки тепловому насосу в місті стабільно 420-450 км, дуже економна.",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddHours(-18)
                    }
                };

                context.ChatMessages.AddRange(messages);
                await context.SaveChangesAsync();

                logger.LogInformation("Database successfully initialized with full demo dataset!");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing/seeding the database.");
        }
    }
}
