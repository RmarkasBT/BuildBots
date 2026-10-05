// Travis County permit lookup. Deliberately dated: Times, gray chrome,
// bordered tables, blue underlined links, tiny text. The ugliness sells it.
const hl = (highlighted, id) => (highlighted === id ? 'outline outline-2 outline-[#0763fb]' : '')

export default function TravisPermits({ pageId, page, typed, highlighted }) {
  const serif = { fontFamily: '"Times New Roman", Times, serif' }
  return (
    <div className="min-h-full p-3 text-[12px] text-black" style={serif}>
      <table className="w-full border-collapse" cellPadding="4">
        <tbody>
          <tr>
            <td className="border border-[#808080] bg-[#003366] text-white" colSpan="2">
              <b className="text-[14px]">TRAVIS COUNTY</b> &nbsp;|&nbsp; Transportation and Natural Resources &nbsp;|&nbsp; Permit Services Online
            </td>
          </tr>
          <tr>
            <td className="border border-[#808080] bg-[#e8e8e8] align-top" style={{ width: 130 }}>
              <div className="text-[11px] leading-5">
                <a className="text-[#0000ee] underline" href="#">Home</a><br />
                <b>Permit Lookup</b><br />
                <a className="text-[#0000ee] underline" href="#">Schedule Inspection</a><br />
                <a className="text-[#0000ee] underline" href="#">Fee Schedule (PDF)</a><br />
                <a className="text-[#0000ee] underline" href="#">Contact</a><br />
                <br />
                <span className="text-[10px] text-[#555]">Best viewed in Internet Explorer 8 or later at 1024x768.</span>
              </div>
            </td>
            <td className="border border-[#808080] bg-white align-top">
              {pageId === 'lookup' ? (
                <div>
                  <h3 className="text-[15px] font-bold">Permit Status Lookup</h3>
                  <hr className="my-2" />
                  <p>Enter a permit number (format YYYY-BP-NNNNN) and press Search.</p>
                  <table cellPadding="3" className="mt-2">
                    <tbody>
                      <tr>
                        <td>Permit No.:</td>
                        <td>
                          <span data-target="permit" className={`inline-block h-5 w-44 border border-[#7f9db9] bg-white px-1 align-middle text-[12px] leading-5 ${hl(highlighted, 'permit')}`}>{typed.permit ?? ''}</span>
                        </td>
                        <td>
                          <span data-target="search" className={`inline-block border border-[#707070] bg-[#ececec] px-3 py-0.5 text-[12px] ${hl(highlighted, 'search')}`}>Search</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mt-3 text-[11px] text-[#555]">* Records are updated nightly. For same-day inspection results call (512) 555-0180.</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-[15px] font-bold">Permit Record</h3>
                  <hr className="my-2" />
                  <table cellPadding="4" className="w-full border-collapse border border-[#808080]">
                    <tbody>
                      {[
                        ['Permit No.', page.permit], ['Site Address', page.address], ['Permit Type', page.type],
                        ['Status', <b key="s" className="text-[#006600]">{page.status}</b>],
                        ['Pending Inspection', page.inspection],
                      ].map(([k, v]) => (
                        <tr key={k}><td className="w-40 border border-[#808080] bg-[#e8e8e8]">{k}</td><td className="border border-[#808080]">{v}</td></tr>
                      ))}
                      <tr>
                        <td className="border border-[#808080] bg-[#e8e8e8]">Scheduled Date</td>
                        <td data-target="scheduled" className={`border border-[#808080] ${hl(highlighted, 'scheduled')}`}><b>{page.scheduled}</b> &nbsp; AM window</td>
                      </tr>
                      {[['Inspector', page.inspector], ['Issued', page.issued], ['Expires', page.expires]].map(([k, v]) => (
                        <tr key={k}><td className="border border-[#808080] bg-[#e8e8e8]">{k}</td><td className="border border-[#808080]">{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2"><a className="text-[#0000ee] underline" href="#">&lt;&lt; New search</a> &nbsp; <a className="text-[#0000ee] underline" href="#">Print</a></p>
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td className="border border-[#808080] bg-[#e8e8e8] text-center text-[10px]" colSpan="2">
              © 2009 Travis County, Texas. All rights reserved. &nbsp; Last updated 09/30/2026 23:14
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
