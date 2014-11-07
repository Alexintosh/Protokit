using System.Collections.Generic;
using System.Web.Http;

namespace Owin.Api
{
    [Authorize]
    public class ProtectedController : ApiController
    {
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }
    }
}

