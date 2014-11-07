using Microsoft.Owin;
using Microsoft.Owin.FileSystems;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.DataHandler.Encoder;
using Microsoft.Owin.Security.Jwt;
using System;
using System.Configuration;
using System.IO;
using System.Web.Http;

namespace Owin.Api
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Configure Web API for self-host. 
            HttpConfiguration config = new HttpConfiguration();
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            var issuer = "https://" + ConfigurationManager.AppSettings["auth0:Domain"] + "/";
            var audience = ConfigurationManager.AppSettings["auth0:ClientId"];
            var secret = TextEncodings.Base64.Encode(TextEncodings.Base64Url.Decode(ConfigurationManager.AppSettings["auth0:ClientSecret"]));

            // Api controllers with an [Authorize] attribute will be validated with JWT
            app.UseJwtBearerAuthentication(
                new JwtBearerAuthenticationOptions
                {
                    AuthenticationMode = AuthenticationMode.Active,
                    AllowedAudiences = new[] { ConfigurationManager.AppSettings["auth0:ClientId"] },
                    IssuerSecurityTokenProviders = new IIssuerSecurityTokenProvider[]
                    {
                        new SymmetricKeyIssuerSecurityTokenProvider(issuer, secret)
                    }
                });


            // serve static content from client folder under api-authentication
            string contentPath = Path.Combine(Environment.CurrentDirectory, @"..\..\..\..\..\client");
            app.UseStaticFiles(new Microsoft.Owin.StaticFiles.StaticFileOptions()
            {
                RequestPath = new PathString(string.Empty),
                FileSystem = new PhysicalFileSystem(contentPath)
            });

            // serve the api
            app.UseWebApi(config);
        }
    }
}
